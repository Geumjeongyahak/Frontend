export type TeacherContact = {
  id: number;
  name: string;
  className: string;
  phone: string;
};

export type TeacherClass = {
  id: string;
  name: string;
  teachers: TeacherContact[];
};

export type StudentContact = {
  id: number;
  name: string;
  phone: string;
};

export type StudentClass = {
  id: string;
  name: string;
  isOpen: boolean;
  students: StudentContact[];
};
