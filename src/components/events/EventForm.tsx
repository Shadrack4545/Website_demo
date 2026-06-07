import { useState } from 'react';
import type { EventInput } from '../../types';

const initialValues: EventInput = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  capacity: 20,
};

interface EventFormProps {
  onSubmit: (values: EventInput) => void;
  onCancel: () => void;
}

export default function EventForm({ onSubmit, onCancel }: EventFormProps) {
  const [values, setValues] = useState<EventInput>(initialValues);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!values.title || !values.date || !values.time || !values.location || !values.description) {
      setError('Please fill in all fields.');
      return;
    }
    if (values.capacity < 1) {
      setError('Capacity must be at least 1.');
      return;
    }
    onSubmit(values);
    setValues(initialValues);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="text-lg font-semibold">Create Event</h3>
      {error && <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      <input
        className="input-field"
        placeholder="Title"
        value={values.title}
        onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="input-field"
          type="date"
          value={values.date}
          onChange={(event) => setValues((prev) => ({ ...prev, date: event.target.value }))}
        />
        <input
          className="input-field"
          type="time"
          value={values.time}
          onChange={(event) => setValues((prev) => ({ ...prev, time: event.target.value }))}
        />
      </div>
      <input
        className="input-field"
        placeholder="Location"
        value={values.location}
        onChange={(event) => setValues((prev) => ({ ...prev, location: event.target.value }))}
      />
      <input
        className="input-field"
        type="number"
        min={1}
        value={values.capacity}
        onChange={(event) => setValues((prev) => ({ ...prev, capacity: Number(event.target.value) }))}
      />
      <textarea
        className="input-field"
        rows={3}
        placeholder="Description"
        value={values.description}
        onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
      />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Save Event
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
