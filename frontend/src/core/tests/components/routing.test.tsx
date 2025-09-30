import { render, screen } from '@testing-library/react';


const MockHome = () => {
  return <div>Новый проект</div>;
};

describe('Routing', () => {
  it('renders Home with Новый проект text', () => {
    render(<MockHome />);
    screen.debug();
    expect(screen.getByText('Новый проект')).toBeInTheDocument();
  });
});