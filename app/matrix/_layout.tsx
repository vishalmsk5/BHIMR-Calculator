import { Stack } from 'expo-router';
import { useThemeStore } from '../../store/useThemeStore';

export default function MatrixLayout() {
  const { theme } = useThemeStore();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  );
}