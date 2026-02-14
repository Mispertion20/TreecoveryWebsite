import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// @ts-ignore - Pagination component exists but TypeScript can't resolve it
import Pagination from '../../../components/Pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
  };

  it('renders pagination controls', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('does not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination {...defaultProps} totalPages={1} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onPageChange when next button is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);
    
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when previous button is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />
    );
    
    const prevButton = screen.getByLabelText('Previous page');
    fireEvent.click(prevButton);
    
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('displays correct page info', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    expect(screen.getByText(/Showing 11 to 20 of 50 results/)).toBeInTheDocument();
  });

  it('calls onPageChange when page number is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);
    
    const pageButton = screen.getByLabelText('Go to page 2');
    fireEvent.click(pageButton);
    
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    const currentPageButton = screen.getByLabelText('Go to page 3');
    expect(currentPageButton).toHaveClass('bg-primary-emerald');
  });

  it('calls onItemsPerPageChange when items per page changes', () => {
    const onItemsPerPageChange = vi.fn();
    render(
      <Pagination
        {...defaultProps}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    );
    
    const select = screen.getByLabelText(/Items per page/);
    fireEvent.change(select, { target: { value: '25' } });
    
    expect(onItemsPerPageChange).toHaveBeenCalledWith(25);
  });

  it('does not render items per page selector when callback is not provided', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.queryByLabelText(/Items per page/)).not.toBeInTheDocument();
  });

  it('shows ellipsis for many pages', () => {
    render(<Pagination {...defaultProps} totalPages={20} currentPage={10} />);
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });
});

