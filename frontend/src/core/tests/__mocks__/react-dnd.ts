import { jest } from '@jest/globals';

const mockReactDnd = {
  DndProvider: jest.fn(({ children }) => children),
  useDrag: jest.fn(() => [jest.fn(), jest.fn(), jest.fn()]),
  useDrop: jest.fn(() => [jest.fn(), jest.fn()]),
};

export default mockReactDnd;