// src/hooks/useCourses.ts

import { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import { Course } from '../types';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: Course) => {
    try {
      const newCourse = await courseService.createCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateCourse = async (courseID: string, courseData: Partial<Course>) => {
    try {
      const updatedCourse = await courseService.updateCourse(courseID, courseData);
      setCourses(prev => prev.map(course => 
        course.courseID === courseID ? updatedCourse : course
      ));
      return updatedCourse;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCourse = async (courseID: string) => {
    try {
      await courseService.deleteCourse(courseID);
      setCourses(prev => prev.filter(course => course.courseID !== courseID));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const searchCourses = async (term: string) => {
    try {
      setLoading(true);
      const results = await courseService.searchCourses(term);
      setCourses(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    searchCourses,
  };
};
