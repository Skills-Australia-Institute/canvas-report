import { createContext, PropsWithChildren, useState } from 'react';
import { Course } from '../supabase/courses';

export interface ISupabaseCoursesContext {
  courses: Course[] | null;
  setCourses: React.Dispatch<React.SetStateAction<Course[] | null>>;
}

export const SupabaseCoursesContext = createContext<ISupabaseCoursesContext>(
  {} as ISupabaseCoursesContext
);

export function SupabaseCoursesProvider(props: PropsWithChildren) {
  const [courses, setCourses] = useState<Course[] | null>(null);
  return (
    <SupabaseCoursesContext.Provider
      value={{
        courses,
        setCourses,
      }}
    >
      {props.children}
    </SupabaseCoursesContext.Provider>
  );
}
