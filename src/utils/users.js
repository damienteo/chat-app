const users = [];

const addUser = ({ id, username, room }) => {
  const nextUsername = username.trim().toLowerCase();
  const nextRoom = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and Room are both require."
    };
  }

  const isExistingUser = users.find(user => {
    return user.room === nextRoom && user.username === nextUsername;
  });

  if (isExistingUser) {
    return {
      error: "Username is in use"
    };
  }

  const user = { id, username: nextUsername, room: nextRoom };
  users.push(user);

  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
