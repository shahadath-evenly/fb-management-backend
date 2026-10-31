export function toSafeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}
