'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchDevices } from '../services/api';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

const DeviceSelector = () => {
  const [devices, setDevices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchDevices()
      .then(res => setDevices(res.data))
      .catch(err => console.error('Erro ao buscar devices', err));
  }, []);

  const handleChange = (e: SelectChangeEvent<string>) => {
    setSelected(e.target.value);
    router.push(`/${e.target.value}`);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="select-device-label">ESP32</InputLabel>
      <Select
        labelId="select-device-label"
        value={selected}
        label="ESP32"
        onChange={handleChange}
      >
        {devices.map(id => (
          <MenuItem key={id} value={id}>
            {id}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DeviceSelector;
