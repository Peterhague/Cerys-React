export function populateUser(session, userId) {
  console.log(session);
  console.log(userId);
  let userObj;
  session["customer"]["users"].forEach((user) => {
    if (user._id === userId) userObj = user;
  });
  return userObj;
}
