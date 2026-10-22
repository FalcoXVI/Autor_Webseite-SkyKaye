/**
 * Contact form on the homepage: validates the fields and sends the message to
 * Netlify Forms in the background, so the visitor stays on the page and sees
 * a confirmation or an error right below the button.
 *
 * Without JavaScript the form still works: the browser checks the `required`
 * and `type="email"` attributes and posts it normally, and Netlify answers
 * with its own success page. No dependencies.
 */
(function () {
  var form = document.querySelector('[data-contact-form]');
  if (!form || !window.fetch) return;

  /* Deliberately loose: one "@", something before it, a dot in the domain.
     The real check is whether the reply arrives. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var MESSAGES = {
    sending: 'Sending…',
    sent: 'Thank you! Your message is on its way, and I\'ll get back to you as soon as I can.',
    failed: 'Sorry, your message could not be sent. Please try again in a moment.'
  };

  var status = form.querySelector('[data-contact-status]');
  var submit = form.querySelector('[type="submit"]');

  // The script takes over validation, so the browser's own bubbles stay away.
  form.noValidate = true;
  form.addEventListener('submit', onSubmit);
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') validateField(e.target);
  });

  /**
   * Returns the error text for one field, or an empty string if it is fine.
   * @param {HTMLInputElement|HTMLTextAreaElement} field
   * @returns {string}
   */
  function errorFor(field) {
    var value = field.value.trim();
    switch (field.name) {
      case 'name': return value ? '' : 'Please tell me your name.';
      case 'email':
        if (!value) return 'Please enter your email address so I can reply.';
        return EMAIL.test(value) ? '' : 'This doesn\'t look like a valid email address.';
      case 'message': return value ? '' : 'Please write a message.';
      default: return '';
    }
  }

  /**
   * Shows or clears the error message of one field.
   * @returns {boolean} Whether the field is valid.
   */
  function validateField(field) {
    var error = errorFor(field);
    var hint = form.querySelector('[data-error-for="' + field.name + '"]');
    field.setAttribute('aria-invalid', error ? 'true' : 'false');
    if (hint) {
      hint.textContent = error;
      hint.hidden = !error;
    }
    return !error;
  }

  function showStatus(state) {
    status.textContent = MESSAGES[state];
    status.className = 'contact-status contact-status--' + state;
    status.hidden = false;
  }

  function onSubmit(e) {
    e.preventDefault();
    var fields = ['name', 'email', 'message'].map(function (n) { return form.elements.namedItem(n); });
    var invalid = fields.filter(function (f) { return !validateField(f); });
    if (invalid.length) {
      status.hidden = true;
      invalid[0].focus();
      return;
    }

    submit.disabled = true;
    showStatus('sending');
    // Netlify Forms expects a urlencoded POST to any path of the site.
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
        showStatus('sent');
      })
      .catch(function () { showStatus('failed'); })
      .then(function () { submit.disabled = false; });
  }
})();
