import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import FilterBar from './index';
describe('FilterBar Component', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<FilterBar filterOptions={[]} filterStatus="" setFilterStatus={() => {}} />);
    expect(getByText('Filter by')).toBeInTheDocument();
  });
  it('handles filter options correctly', () => {
    const setFilterStatus = jest.fn();
    const { getByText } = render(<FilterBar filterOptions={['Option 1', 'Option 2']} filterStatus="" setFilterStatus={setFilterStatus} />);
    fireEvent.click(getByText('Option 1'));
    expect(setFilterStatus).toHaveBeenCalledWith('Option 1');
  });
});


