const { handleSubmit, isValidEmail } = require('../test-utils');

describe('test-utils', () => {
  test('isValidEmail recognizes valid and invalid emails', () => {
    expect(isValidEmail('alice@example.com')).toBe(true);
    expect(isValidEmail('bad-email')).toBe(false);
    expect(isValidEmail('a@b.c')).toBe(true);
    expect(isValidEmail('')).toBe(false);
  });

  test('handleSubmit prevents default, sets message, and resets form', () => {
    // setup DOM
    document.body.innerHTML = `
      <div id="form-msg"></div>
      <form id="contactForm"></form>
    `;
    const form = document.getElementById('contactForm');
    form.reset = jest.fn();

    const ev = { preventDefault: jest.fn(), target: form };
    handleSubmit(ev);

    expect(ev.preventDefault).toHaveBeenCalled();
    expect(document.getElementById('form-msg').textContent).toBe("Thanks! We'll be in touch within one business day.");
    expect(form.reset).toHaveBeenCalled();
  });
});
