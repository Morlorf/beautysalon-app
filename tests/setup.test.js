const mongoose = require('mongoose');

describe('Database Connection', () => {
  test('should connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});