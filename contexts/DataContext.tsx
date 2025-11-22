import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Donation, Expense, VolunteerApplication, Document } from '../types';
import { PROJECTS, RECENT_DONATIONS, MOCK_EXPENSES, MOCK_VOLUNTEER_APPS, MOCK_DOCUMENTS } from '../constants';
import { dbService } from '../services/db';

interface DataContextType {
  projects: Project[];
  donations: Donation[];
  expenses: Expense[];
  volunteers: VolunteerApplication[];
  documents: Document[]; // Global documents
  isLoading: boolean;
  
  // Actions
  addProject: (project: Project) => Promise<void>;
  updateProject: (updatedProject: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  addDocument: (doc: Document) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  addVolunteer: (volunteer: VolunteerApplication) => Promise<void>;
  deleteVolunteer: (id: string) => Promise<void>;
  
  addExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  addDonation: (donation: Donation) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Data from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dbProjects, dbDonations, dbExpenses, dbVolunteers, dbDocuments] = await Promise.all([
          dbService.getAll('projects'),
          dbService.getAll('donations'),
          dbService.getAll('expenses'),
          dbService.getAll('volunteers'),
          dbService.getAll('documents')
        ]);

        // If DB is empty (first load), populate with constants (optional, currently constants are empty arrays as requested)
        setProjects(dbProjects.length ? dbProjects : PROJECTS);
        setDonations(dbDonations.length ? dbDonations : RECENT_DONATIONS);
        setExpenses(dbExpenses.length ? dbExpenses : MOCK_EXPENSES);
        setVolunteers(dbVolunteers.length ? dbVolunteers : MOCK_VOLUNTEER_APPS);
        setDocuments(dbDocuments.length ? dbDocuments : MOCK_DOCUMENTS);
      } catch (error) {
        console.error("Failed to load data from internal DB", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Actions ---

  const addProject = async (project: Project) => {
    await dbService.add('projects', project);
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = async (updatedProject: Project) => {
    await dbService.update('projects', updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = async (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    await dbService.delete('projects', id);
    setProjects(prev => prev.filter(p => p.id !== id));

    if (projectToDelete) {
      // Cascade Delete: Remove Donations associated with this project
      const relatedDonations = donations.filter(d => d.campaign === projectToDelete.title);
      for (const d of relatedDonations) {
        await dbService.delete('donations', d.id);
      }
      setDonations(prev => prev.filter(d => d.campaign !== projectToDelete.title));

      // Cascade Delete: Remove Documents associated with this project from Global Hub
      if (projectToDelete.documents && projectToDelete.documents.length > 0) {
        const projectDocIds = projectToDelete.documents.map(d => d.id);
        for (const docId of projectDocIds) {
          await dbService.delete('documents', docId);
        }
        setDocuments(prev => prev.filter(d => !projectDocIds.includes(d.id)));
      }
    }
  };

  const addDocument = async (doc: Document) => {
    // Check if exists to prevent duplicates
    const exists = documents.some(d => d.id === doc.id);
    if (!exists) {
      await dbService.add('documents', doc);
      setDocuments(prev => [doc, ...prev]);
    }
  };

  const deleteDocument = async (id: string) => {
    await dbService.delete('documents', id);
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addVolunteer = async (volunteer: VolunteerApplication) => {
    await dbService.add('volunteers', volunteer);
    setVolunteers(prev => [volunteer, ...prev]);
  };

  const deleteVolunteer = async (id: string) => {
    await dbService.delete('volunteers', id);
    setVolunteers(prev => prev.filter(v => v.id !== id));
  };

  const addExpense = async (expense: Expense) => {
    await dbService.add('expenses', expense);
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = async (id: string) => {
    await dbService.delete('expenses', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addDonation = async (donation: Donation) => {
    await dbService.add('donations', donation);
    setDonations(prev => [donation, ...prev]);
  };

  const deleteDonation = async (id: string) => {
    await dbService.delete('donations', id);
    setDonations(prev => prev.filter(d => d.id !== id));
  };

  return (
    <DataContext.Provider value={{
      projects,
      donations,
      expenses,
      volunteers,
      documents,
      isLoading,
      addProject,
      updateProject,
      deleteProject,
      addDocument,
      deleteDocument,
      addVolunteer,
      deleteVolunteer,
      addExpense,
      deleteExpense,
      addDonation,
      deleteDonation
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
