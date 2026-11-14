// Điều hướng gốc. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Chú Tủng' }} />
      <Stack.Screen name="heatmap" options={{ title: 'Heatmap' }} />
      <Stack.Screen name="topic/[id]" options={{ title: 'Chủ đề' }} />
      <Stack.Screen name="plan" options={{ title: 'Lộ trình' }} />
    </Stack>
  );
}
