/**
 * Contact form on the homepage: validates the fields and sends the message to
 * Formspree in the background, so the visitor stays on the page and sees
 * a confirmation or an error right below the button.
 *
 * Without JavaScript the form still works: the browser checks the `required`
 * and `type="email"` attributes and posts it to the form's `action`, and
 * Formspree answers with its own thank-you page. No dependencies.
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
    failed: 'Sorry, your message could not be sent. Please try again in a moment.',
    throttled: 'Too many messages were sent in a short time. Please wait a minute and try again.'
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

    window.askTransferConsent().then(function (agreed) {
      if (agreed) send(fields);
      else submit.focus();
    });
  }

  /**
   * Posts the form to Formspree, together with a record of the visitor's
   * consent to the transfer, and shows the outcome below the button.
   * @param {Array<HTMLInputElement|HTMLTextAreaElement>} fields The validated fields.
   */
  function send(fields) {
    var data = new FormData(form);
    // Arrives in the submission email, so the consent stays on record.
    data.append('us_transfer_consent', 'Agreed in the consent dialog on ' + new Date().toISOString());

    submit.disabled = true;
    showStatus('sending');
    // With "Accept: application/json" Formspree answers with a status code
    // instead of redirecting to its thank-you page. The honeypot `_gotcha`
    // travels along; Formspree silently drops submissions that fill it in.
    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    })
      .then(function (res) {
        if (!res.ok) throw res;
        form.reset();
        fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
        showStatus('sent');
      })
      // 429 is Formspree's rate limit, which the visitor should hear about.
      .catch(function (err) { showStatus(err && err.status === 429 ? 'throttled' : 'failed'); })
      .then(function () { submit.disabled = false; });
  }
})();
