module.exports = {
  isOwner: function (req) {
    if (req.user) return true;
    else return false;
  },
  statusUI: function (req) {
    if (this.isOwner(req))
      return `${req.user.displayName} | <a href="/auth/logout">logout</a>`;

    return `<a href="/auth/login">login</a> | <a href="/auth/register">register</a> | <a href="/auth/google">Login with google</a>`;
  },
};
