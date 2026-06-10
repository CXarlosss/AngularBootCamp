import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnnexesDashboard } from '@/components/clinical/AnnexesDashboard';
import { useAuth } from '@/app/providers/AuthContext';
import { patientService } from '@/core/services/patientService';

export function PatientAnnexesView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patientName, setPatientName] = useState<string>('');

  useEffect(() => {
    if (!patientId || !user) return;
    
    patientService.getById(patientId).then(patient => {
      if (patient) {
        setPatientName(patient.name);
      } else {
        navigate('/therapist');
      }
    });
  }, [patientId, user, navigate]);

  if (!user || !patientId || !patientName) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando anexos...</div>;
  }

  return (
    <AnnexesDashboard 
      patientId={patientId} 
      therapistId={user.id} 
      patientName={patientName} 
    />
  );
}
