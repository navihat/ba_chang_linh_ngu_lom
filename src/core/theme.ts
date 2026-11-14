// Màu và khoảng cách dùng chung. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.
export const colors = {
  background: '#FFFFFF',
  surface: '#F4F5F7',
  text: '#1B1F24',
  muted: '#6B7280',
  primary: '#D7382E',
  onPrimary: '#FFFFFF',
  border: '#E2E5EA',
  correct: '#1F9D55',
  wrong: '#D7382E',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 };

// Thang màu heatmap: nguội → nóng
const HEAT_SCALE = ['#E3F1E7', '#FFE9A8', '#FFC069', '#F7743B', '#D7382E'];

export function heatColor(heat: number): string {
  const i = Math.min(HEAT_SCALE.length - 1, Math.max(0, Math.floor(heat * HEAT_SCALE.length)));
  return HEAT_SCALE[i];
}

// Màu chữ đọc được trên nền heatColor(heat)
export function heatTextColor(heat: number): string {
  return heat >= 0.6 ? '#FFFFFF' : colors.text;
}
