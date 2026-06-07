/**
 * EventContext - Global Event State Management
 * 
 * Manages:
 * - All community events
 * - Event creation/editing/deletion
 * - RSVP tracking (broadcast invitations)
 * - Attendance tracking
 * - Event reminders
 */

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Announcement, Event, EventInput, Notification, RSVPStatus } from '../types';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';
import { getEventTimestamp, isWithin24Hours } from '../utils/date';

interface EventContextType {
  events: Event[];
  createEvent: (event: EventInput & { createdBy: string; rsvps?: Record<string, RSVPStatus> }) => Event;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  rsvpEvent: (eventId: string, userId: string, status: RSVPStatus) => void;
  sendInvitations: (eventId: string, memberIds: string[], senderId: string) => void;
  recordAttendance: (eventId: string, userId: string, attended: boolean) => void;
  getRSVPCounts: (eventId: string) => { attending: number; maybe: number; notAttending: number };
  getEventById: (eventId: string) => Event | undefined;
  getUpcomingEvents: () => Event[];
  getPastEvents: () => Event[];
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

interface EventProviderProps {
  children: ReactNode;
}

export function EventProvider({ children }: EventProviderProps) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const storedEvents = getData<Event[]>(STORAGE_KEYS.EVENTS, []) ?? [];
    setEvents(storedEvents);
  }, []);

  useEffect(() => {
    setData(STORAGE_KEYS.EVENTS, events);
  }, [events]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEvents((current) => {
        const notifications = getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []) ?? [];
        const announcements = getData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []) ?? [];
        let changed = false;
        const updatedEvents = current.map((event) => {
          if (event.status !== 'upcoming' || event.reminderSentAt) return event;
          if (!isWithin24Hours(event.date, event.time)) return event;

          changed = true;
          const attendeeIds = Object.entries(event.rsvps)
            .filter(([, status]) => status === 'attending')
            .map(([userId]) => userId);

          attendeeIds.forEach((userId) => {
            notifications.unshift({
              id: createId('notif'),
              recipientId: userId,
              recipientScope: 'user',
              type: 'reminder',
              title: `Reminder: ${event.title} is tomorrow`,
              message: `${event.title} starts at ${event.time} on ${event.date}.`,
              relatedId: event.id,
              read: false,
              createdAt: Date.now(),
            });
          });

          const reminderAnnouncementId = createId('announcement');
          announcements.unshift({
            id: reminderAnnouncementId,
            title: `Reminder: ${event.title}`,
            content: `This event is happening within 24 hours. RSVP status and details are in the Events page.`,
            category: 'events',
            createdBy: event.createdBy,
            linkedEventId: event.id,
            isPinned: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          return { ...event, reminderSentAt: Date.now(), reminderAnnouncementId, updatedAt: Date.now() };
        });

        if (changed) {
          setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
          setData(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
        }
        return updatedEvents;
      });
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const createEvent = (
    eventData: EventInput & { createdBy: string; rsvps?: Record<string, RSVPStatus> }
  ): Event => {
    const now = Date.now();
    const { rsvps, ...eventFields } = eventData;
    const newEvent: Event = {
      ...eventFields,
      id: createId('event'),
      createdAt: now,
      updatedAt: now,
      rsvps: rsvps ?? {},
      attendees: [],
      noShows: [],
      status: 'upcoming',
    };
    const announcementId = createId('announcement');
    newEvent.linkedAnnouncementId = announcementId;

    const allAnnouncements = getData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []) ?? [];
    allAnnouncements.unshift({
      id: announcementId,
      title: `New Event: ${newEvent.title}`,
      content: `${newEvent.title} has been scheduled for ${newEvent.date} at ${newEvent.time} in ${newEvent.location}.`,
      category: 'events',
      createdBy: newEvent.createdBy,
      linkedEventId: newEvent.id,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });
    setData(STORAGE_KEYS.ANNOUNCEMENTS, allAnnouncements);

    const notifications = getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []) ?? [];
    notifications.unshift({
      id: createId('notif'),
      recipientId: 'all',
      recipientScope: 'all',
      type: 'announcement',
      title: `New event posted: ${newEvent.title}`,
      message: `Check event details and RSVP in Events.`,
      relatedId: announcementId,
      read: false,
      createdAt: now,
    });
    setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...updates, updatedAt: Date.now() } : e)));
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const rsvpEvent = (eventId: string, userId: string, status: RSVPStatus) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;
        return {
          ...event,
          rsvps: { ...event.rsvps, [userId]: status },
          updatedAt: Date.now(),
        };
      })
    );
  };

  const sendInvitations = (eventId: string, memberIds: string[], senderId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const notifications = getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []) ?? [];
    memberIds.forEach((memberId) => {
      notifications.unshift({
        id: createId('notif'),
        recipientId: memberId,
        recipientScope: 'user',
        type: 'invitation',
        title: `You're invited to ${event.title}`,
        message: `${event.title} - ${event.date} at ${event.time} in ${event.location}`,
        relatedId: eventId,
        read: false,
        createdAt: Date.now(),
      });
    });
    setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    updateEvent(eventId, { invitationSentAt: Date.now() });

    const announcements = getData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []) ?? [];
    announcements.unshift({
      id: createId('announcement'),
      title: `Invitations Sent: ${event.title}`,
      content: `A leader sent invitations to all directory members for this event.`,
      category: 'events',
      createdBy: senderId,
      linkedEventId: eventId,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setData(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  };

  const recordAttendance = (eventId: string, userId: string, attended: boolean) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;
        const attendees = event.attendees.includes(userId)
          ? event.attendees
          : attended
          ? [...event.attendees, userId]
          : event.attendees;
        const noShows = attended
          ? event.noShows.filter((id) => id !== userId)
          : event.rsvps[userId] === 'attending' && !attendees.includes(userId)
          ? [...new Set([...event.noShows, userId])]
          : event.noShows;
        const status =
          Date.now() >= getEventTimestamp(event.date, event.time) ? 'completed' : event.status;
        return { ...event, attendees, noShows, status, updatedAt: Date.now() };
      })
    );
  };

  const getRSVPCounts = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    const values = Object.values(event?.rsvps ?? {});
    return {
      attending: values.filter((value) => value === 'attending').length,
      maybe: values.filter((value) => value === 'maybe').length,
      notAttending: values.filter((value) => value === 'notAttending').length,
    };
  };

  const getEventById = (eventId: string): Event | undefined => {
    return events.find((e) => e.id === eventId);
  };

  const getUpcomingEvents = (): Event[] => {
    const now = new Date();
    return events
      .filter((e) => e.status === 'upcoming' && new Date(`${e.date}T${e.time}`) > now)
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  };

  const getPastEvents = (): Event[] => {
    const now = new Date();
    return events
      .filter((e) => e.status === 'completed' || new Date(`${e.date}T${e.time}`) <= now)
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  };

  return (
    <EventContext.Provider
      value={{
        events,
        createEvent,
        updateEvent,
        deleteEvent,
        rsvpEvent,
        sendInvitations,
        recordAttendance,
        getRSVPCounts,
        getEventById,
        getUpcomingEvents,
        getPastEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}
