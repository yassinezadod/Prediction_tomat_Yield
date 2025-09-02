// src/services/courseService.ts

import { apiClient } from './api';
import { Course } from '../types';

class CourseService {
  // Récupérer tous les cours
  async getAllCourses(): Promise<Course[]> {
    try {
      const response = await apiClient.get<Course[]>('/courses');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des cours');
    }
  }

  // Récupérer un cours par ID
  async getCourseById(courseID: string): Promise<Course> {
    try {
      const response = await apiClient.get<Course>(`/courses/${courseID}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cours non trouvé');
    }
  }

  // Créer un nouveau cours
  async createCourse(courseData: Course): Promise<Course> {
    try {
      const response = await apiClient.post<Course>('/courses', courseData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du cours');
    }
  }

  // Mettre à jour un cours
  async updateCourse(courseID: string, courseData: Partial<Course>): Promise<Course> {
    try {
      const response = await apiClient.put<Course>(`/courses/${courseID}`, courseData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du cours');
    }
  }

  // Supprimer un cours
  async deleteCourse(courseID: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/courses/${courseID}`);
      return { message: response as string || 'Cours supprimé avec succès' };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du cours');
    }
  }

  // Rechercher des cours par terme
  async searchCourses(term: string): Promise<Course[]> {
    try {
      const courses = await this.getAllCourses();
      return courses.filter(course => 
        course.title.toLowerCase().includes(term.toLowerCase()) ||
        course.description.toLowerCase().includes(term.toLowerCase()) ||
        course.courseID.toLowerCase().includes(term.toLowerCase())
      );
    } catch (error: any) {
      throw new Error('Erreur lors de la recherche des cours');
    }
  }

  // Filtrer les cours par terme
  async getCoursesByTerm(term: string): Promise<Course[]> {
    try {
      const courses = await this.getAllCourses();
      return courses.filter(course => course.term === term);
    } catch (error: any) {
      throw new Error('Erreur lors du filtrage des cours par terme');
    }
  }

  // Récupérer les termes disponibles
  async getAvailableTerms(): Promise<string[]> {
    try {
      const courses = await this.getAllCourses();
      const terms = [...new Set(courses.map(course => course.term))];
      return terms.sort();
    } catch (error: any) {
      throw new Error('Erreur lors de la récupération des termes');
    }
  }
}

export const courseService = new CourseService();