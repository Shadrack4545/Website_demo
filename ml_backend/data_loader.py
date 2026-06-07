"""
Data Loader Module
Loads CSV data from templates and validates it
"""

import pandas as pd
import os
from typing import Tuple, Dict, List
from pathlib import Path

class DataLoader:
    """Load and validate student, event, and attendance data from CSV files"""
    
    def __init__(self, data_dir: str = "DATA_TEMPLATES"):
        self.data_dir = data_dir
        self.students_df = None
        self.events_df = None
        self.attendance_df = None
        
    def load_all_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Load all three CSV files
        
        Returns:
            Tuple of (students_df, events_df, attendance_df)
        """
        print(f"Loading data from {self.data_dir}...")
        
        # Load students
        students_path = os.path.join(self.data_dir, "1_STUDENT_PROFILES_TEMPLATE.csv")
        self.students_df = pd.read_csv(students_path)
        print(f"Loaded {len(self.students_df)} students")
        
        # Load events
        events_path = os.path.join(self.data_dir, "2_EVENTS_TEMPLATE.csv")
        self.events_df = pd.read_csv(events_path)
        print(f"Loaded {len(self.events_df)} events")
        
        # Load attendance/RSVPs
        attendance_path = os.path.join(self.data_dir, "3_ATTENDANCE_RSVPS_TEMPLATE.csv")
        self.attendance_df = pd.read_csv(attendance_path)
        print(f"Loaded {len(self.attendance_df)} RSVP records")
        
        return self.students_df, self.events_df, self.attendance_df
    
    def validate_data(self) -> Dict[str, List[str]]:
        """
        Validate data integrity and return errors
        
        Returns:
            Dict with validation results
        """
        errors = {}
        
        # Validate students
        student_errors = []
        if self.students_df is None:
            student_errors.append("Students data not loaded")
        else:
            required_cols = ['student_id', 'first_name', 'country', 'program', 
                            'academic_load', 'previous_attendance_rate']
            missing = [col for col in required_cols if col not in self.students_df.columns]
            if missing:
                student_errors.append(f"Missing columns: {missing}")
        
        if student_errors:
            errors['students'] = student_errors
        else:
            print("Students data valid")
        
        # Validate events
        event_errors = []
        if self.events_df is None:
            event_errors.append("Events data not loaded")
        else:
            required_cols = ['event_id', 'event_title', 'event_date', 'event_type', 
                            'has_incentive', 'lead_time_days']
            missing = [col for col in required_cols if col not in self.events_df.columns]
            if missing:
                event_errors.append(f"Missing columns: {missing}")
        
        if event_errors:
            errors['events'] = event_errors
        else:
            print("Events data valid")
        
        # Validate attendance
        attendance_errors = []
        if self.attendance_df is None:
            attendance_errors.append("Attendance data not loaded")
        else:
            required_cols = ['student_id', 'event_id', 'rsvp_status', 'actual_attendance']
            missing = [col for col in required_cols if col not in self.attendance_df.columns]
            if missing:
                attendance_errors.append(f"Missing columns: {missing}")
            
            # Check RSVP status values
            valid_statuses = ['attending', 'notAttending', 'maybe']
            invalid_statuses = self.attendance_df[~self.attendance_df['rsvp_status'].isin(valid_statuses)]
            if len(invalid_statuses) > 0:
                attendance_errors.append(f"Invalid RSVP statuses found: {invalid_statuses['rsvp_status'].unique()}")
            
            # Check actual_attendance values
            invalid_attendance = self.attendance_df[~self.attendance_df['actual_attendance'].isin([0, 1])]
            if len(invalid_attendance) > 0:
                attendance_errors.append(f"Invalid actual_attendance values (should be 0 or 1)")
        
        if attendance_errors:
            errors['attendance'] = attendance_errors
        else:
            print("Attendance data valid")
        
        return errors
    
    def get_summary(self) -> Dict:
        """Get data summary statistics"""
        summary = {
            'total_students': len(self.students_df) if self.students_df is not None else 0,
            'total_events': len(self.events_df) if self.events_df is not None else 0,
            'total_rsvps': len(self.attendance_df) if self.attendance_df is not None else 0,
            'attendance_rate': None
        }
        
        if self.attendance_df is not None:
            total_attended = len(self.attendance_df[self.attendance_df['actual_attendance'] == 1])
            attendance_pct = (total_attended / len(self.attendance_df)) * 100
            summary['attendance_rate'] = f"{attendance_pct:.1f}%"
        
        return summary


if __name__ == "__main__":
    # Example usage
    loader = DataLoader()
    students, events, attendance = loader.load_all_data()
    
    # Validate
    errors = loader.validate_data()
    if errors:
        print("\n❌ Validation errors:")
        for key, error_list in errors.items():
            print(f"  {key}: {error_list}")
    else:
        print("\n✅ All data valid!")
    
    # Summary
    summary = loader.get_summary()
    print(f"\n📊 Data Summary:")
    for key, value in summary.items():
        print(f"  {key}: {value}")
