import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Job {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  contractor: string | null;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface Contractor {
  id: number;
  name: string;
  rating: number;
  lat: number;
  lng: number;
  stripeId: string;
}

interface AppContextType {
  jobs: Job[];
  contractors: Contractor[];
  loading: boolean;
  addJob: (job: Omit<Job, 'id' | 'status' | 'contractor' | 'createdAt'>) => Promise<void>;
  acceptJob: (id: number) => Promise<void>;
  refreshJobs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const loadContractors = async () => {
    try {
      const res = await fetch('/api/contractors');
      const data = await res.json();
      setContractors(data);
    } catch (error) {
      console.error('Failed to fetch contractors:', error);
    }
  };

  const seedData = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
    } catch (error) {
      console.error('Failed to seed:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await seedData();
      await Promise.all([refreshJobs(), loadContractors()]);
      setLoading(false);
    };
    init();
  }, []);

  const addJob = async (newJob: Omit<Job, 'id' | 'status' | 'contractor' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newJob.title,
          description: newJob.description,
          price: newJob.price,
          lat: newJob.lat,
          lng: newJob.lng,
          status: 'open',
          contractor: null,
        }),
      });
      if (res.ok) {
        await refreshJobs();
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const acceptJob = async (id: number) => {
    try {
      // Pick a random contractor
      const randomContractor = contractors[Math.floor(Math.random() * contractors.length)];
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          contractor: randomContractor?.name || 'Verified Contractor',
        }),
      });
      if (res.ok) {
        await refreshJobs();
      }
    } catch (error) {
      console.error('Failed to accept job:', error);
    }
  };

  return (
    <AppContext.Provider value={{ jobs, contractors, loading, addJob, acceptJob, refreshJobs }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
