-- Añadir columna de PIN a patient_profiles
ALTER TABLE patient_profiles ADD COLUMN pin VARCHAR(4) DEFAULT '0000';

-- Asegurar que el PIN por defecto para los registros existentes sea '0000'
UPDATE patient_profiles SET pin = '0000' WHERE pin IS NULL;

-- Hacer que la columna no sea nula para el futuro
ALTER TABLE patient_profiles ALTER COLUMN pin SET NOT NULL;
