// Bộ màu riêng của Chú Tủng: mực tím trên vở ô ly, đỏ cam của heatmap làm màu hành động.
// Hiện chỉ dùng trong module analysis; muốn áp cho cả app thì đưa vào src/core/theme.ts (vùng đóng băng).
export const brand = {
  ink: '#4B2BB8', // mực tím: nền hero, viền, chữ nhấn
  inkDeep: '#2A1873', // mực tím đậm: chữ tiêu đề
  inkSoft: '#EEEAFE', // tím nhạt: nền ô đã chọn file
  paper: '#F7F6FF', // giấy vở hơi ngả tím
  gridLine: 'rgba(255,255,255,0.10)', // dòng ô ly trên nền mực
  gridLineStrong: 'rgba(255,255,255,0.22)', // dòng kẻ đậm mỗi 4 ô
  chalk: '#FFD23F', // vàng phấn: số mục tiêu
  text: '#1E1640',
  muted: '#6E6890',
  line: '#DCD6F5',
};
