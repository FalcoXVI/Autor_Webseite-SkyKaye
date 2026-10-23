/**
 * Consent dialog for the contact form: before a message leaves the page, the
 * visitor has to agree explicitly to its transfer to Formspree in the United
 * States (Article 49(1)(a) GDPR). The markup is the `[data-transfer-consent]`
 * <dialog> in index.html; contact-form.js asks through
 * `window.askTransferConsent()`.
 *
 * Browsers without <dialog> support fall back to window.confirm, so nobody
 * can send the form without having been asked. No dependencies.
 */
(function () {
  var dialog = document.querySelector('[data-transfer-consent]');

  var FALLBACK_TEXT = 'Your message will be sent through Formspree, Inc. in the United States. ' +
    'Formspree has not stated an EU-recognised safeguard for this transfer, so US authorities may be ' +
    'able to access your data and you may not be able to enforce your rights effectively. ' +
    'Do you agree to this transfer?';

  /**
   * Shows the consent dialog and waits for the visitor's answer.
   * @returns {Promise<boolean>} True only if the visitor clicked "Agree and send";
   *   Cancel, Escape and closing the dialog all count as no.
   */
  window.askTransferConsent = function () {
    if (!dialog || typeof dialog.showModal !== 'function') {
      return Promise.resolve(window.confirm(FALLBACK_TEXT));
    }
    return new Promise(function (resolve) {
      dialog.returnValue = '';
      dialog.addEventListener('close', function () {
        resolve(dialog.returnValue === 'agree');
      }, { once: true });
      dialog.showModal();
    });
  };
})();
