import { Feature, Service } from '../types';

export const features: Feature[] = [
  { id: 'F1', name: 'A/C Maintenance', icon: 'Wind' },
  { id: 'F2', name: 'Plumbing', icon: 'Droplet' },
  { id: 'F3', name: 'Carpentry', icon: 'Hammer' },
  { id: 'F4', name: 'Electricity', icon: 'Zap' },
  { id: 'F5', name: 'Alumetal', icon: 'Box' },
  { id: 'F6', name: 'Furniture Cleaning', icon: 'Sparkles' },
];

export const services: Service[] = [
  // A/C Maintenance
  { id: 'S1', featureId: 'F1', name: 'AC Unit Cleaning', price: 150, engineerId: 'E1', engineerName: 'Ahmad Khalil', description: 'Complete AC unit cleaning and filter replacement' },
  { id: 'S2', featureId: 'F1', name: 'AC Repair', price: 280, engineerId: 'E2', engineerName: 'Sami Nasser', description: 'Diagnose and repair AC issues' },
  { id: 'S3', featureId: 'F1', name: 'AC Installation', price: 450, engineerId: 'E1', engineerName: 'Ahmad Khalil', description: 'New AC unit installation' },
  
  // Plumbing
  { id: 'S4', featureId: 'F2', name: 'Pipe Leak Repair', price: 120, engineerId: 'E3', engineerName: 'Omar Hasan', description: 'Fix leaking pipes and faucets' },
  { id: 'S5', featureId: 'F2', name: 'Toilet Repair', price: 100, engineerId: 'E3', engineerName: 'Omar Hasan', description: 'Repair or replace toilet components' },
  { id: 'S6', featureId: 'F2', name: 'Water Heater Install', price: 350, engineerId: 'E4', engineerName: 'Khalid Abbas', description: 'Install new water heater' },
  
  // Carpentry
  { id: 'S7', featureId: 'F3', name: 'Door Repair', price: 180, engineerId: 'E5', engineerName: 'Yusuf Tamer', description: 'Fix or replace door hinges and locks' },
  { id: 'S8', featureId: 'F3', name: 'Cabinet Installation', price: 400, engineerId: 'E5', engineerName: 'Yusuf Tamer', description: 'Custom cabinet installation' },
  { id: 'S9', featureId: 'F3', name: 'Window Frame Repair', price: 200, engineerId: 'E6', engineerName: 'Majed Salim', description: 'Repair wooden window frames' },
  
  // Electricity
  { id: 'S10', featureId: 'F4', name: 'Lighting Repair', price: 120, engineerId: 'E7', engineerName: 'Hana Mahmoud', description: 'Fix lighting issues in rooms' },
  { id: 'S11', featureId: 'F4', name: 'Main Panel Check', price: 250, engineerId: 'E7', engineerName: 'Hana Mahmoud', description: 'Inspect and test electrical panel' },
  { id: 'S12', featureId: 'F4', name: 'Outlet Installation', price: 80, engineerId: 'E8', engineerName: 'Tariq Issa', description: 'Install new electrical outlets' },
  
  // Alumetal
  { id: 'S13', featureId: 'F5', name: 'Window Grill Install', price: 320, engineerId: 'E9', engineerName: 'Nabil Farid', description: 'Install aluminum window grills' },
  { id: 'S14', featureId: 'F5', name: 'Door Frame Repair', price: 190, engineerId: 'E9', engineerName: 'Nabil Farid', description: 'Fix aluminum door frames' },
  
  // Furniture Cleaning
  { id: 'S15', featureId: 'F6', name: 'Sofa Deep Cleaning', price: 180, engineerId: 'E10', engineerName: 'Sara Jamil', description: 'Professional sofa and upholstery cleaning' },
  { id: 'S16', featureId: 'F6', name: 'Carpet Cleaning', price: 150, engineerId: 'E10', engineerName: 'Sara Jamil', description: 'Deep carpet cleaning service' },
];
