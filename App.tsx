import './global.css';

import { StatusBar } from 'expo-status-bar';

import { RootNavigation } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <>
      <RootNavigation />
      <StatusBar style="auto" />
    </>
  );
}
