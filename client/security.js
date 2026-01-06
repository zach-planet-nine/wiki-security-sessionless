window.plugins = window.plugins || {};
window.plugins.security = {
  setup: function(user) {
    console.log('Sessionless security module loaded');
    
    return {
      user: user,
      authenticated: !!user
    };
  }
};
