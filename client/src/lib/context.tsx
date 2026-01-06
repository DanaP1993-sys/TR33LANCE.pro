import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Job {
  id: number;
  title: string;
  description: string;
  price: number;
  status: 'open' | 'accepted' | 'completed';
  contractor: string | null;
  lat: number;
  lng: number;
  createdAt: Date;
}

export interface Contractor {
  id: number;
  name: string;
  rating: number;
  lat: number;
  lng: number;
  stripeId: string;
}

const initialJobs: Job[] = [
  {
    id: 1,
    title: 'Oak Tree Trimming',
    description: 'Large oak tree in front yard needs trimming away from power lines.',
    price: 450,
    status: 'open',
    contractor: null,
    lat: 29.7604,
    lng: -95.3698,
    createdAt: new Date()
  },
  {
    id: 2,
    title: 'Stump Removal',
    description: 'Old pine stump in backyard, approx 2ft diameter.',
    price: 200,
    status: 'accepted',
    contractor: 'Green Leaf Crew',
    lat: 29.7400,
    lng: -95.3900,
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 3,
    title: 'Emergency Storm Cleanup',
    description: 'Fallen branch blocking driveway after storm.',
    price: 600,
    status: 'open',
    contractor: null,
    lat: 29.7800,
    lng: -95.3500,
    createdAt: new Date(Date.now() - 3600000)
  }
];

export const contractors: Contractor[] = [
  { id: 1, name: 'Green Leaf Crew', rating: 4.8, lat: 29.75, lng: -95.37, stripeId: 'acct_1' },
  { id: 2, name: 'Texas Tree Pros', rating: 4.9, lat: 29.77, lng: -95.34, stripeId: 'acct_2' },
  { id: 3, name: 'Arbor Experts', rating: 4.7, lat: 29.73, lng: -95.40, stripeId: 'acct_3' }
];

interface AppContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'status' | 'contractor' | 'createdAt'>) => void;
  acceptJob: (id: number) => void;
  contractors: Contractor[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const addJob = (newJob: Omit<Job, 'id' | 'status' | 'contractor' | 'createdAt'>) => {
    const job: Job = {
      ...newJob,
      id: Date.now(),
      status: 'open',
      contractor: null,
      createdAt: new Date()
    };
    setJobs([job, ...jobs]);
  };

  const acceptJob = (id: number) => {
    setJobs(jobs.map(j => {
      if (j.id === id) {
        // Randomly assign a contractor for demo
        const randomContractor = contractors[Math.floor(Math.random() * contractors.length)];
        return { ...j, status: 'accepted', contractor: randomContractor.name };
      }
      return j;
    }));
  };

  return (
    <AppContext.Provider value={{ jobs, addJob, acceptJob, contractors }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
