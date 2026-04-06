import { render, screen } from '@testing-library/react';
import App from './App';

test('renders password modal on startup', () => {
  render(<App />);
  const header = screen.getByText(/Nhập mật khẩu để sử dụng/i);
  expect(header).toBeInTheDocument();
});
