const users = [];

// add user, remove user,get user,get users in room

const addUser = ({ id, username, room }) => {
    //   Clean the data

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data

    if (!username || !room) {
        return {
            error: "username and room are required"
        }
    }

    // check for existing users

    const existingUser = users.find((u) => {
        return u.room === room && u.username === username
    })

    // validate username

    if (existingUser) {
        return {
            error: "username is in use!"
        }
    }
    // store user

    const user = { id, username, room }

    users.push(user);

    return {
        user
    }
}

const removeUser = (id) => {
    const index = users.findIndex(user => {
        return user.id === id
    });

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const u = users.find(user => {
        return user.id === id
    })
    if (!u) {
        return undefined;
    } else {
        return u;
    }
}

const getUsersInRoom = (room) => {
    if(room){
        room = room.trim();
    }
    const u = users.filter(user => {
        return user.room === room;
    })
    if (!u) {
        return "room not found"
    } else {
        return u;
    }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


