document.addEventListener('DOMContentLoaded', function() {
  const stickyBar = document.getElementById('sticky-atc-bar');
  if (!stickyBar) return;

  const sectionId = stickyBar.querySelector('product-form').dataset.sectionId;
  const mainAtcButton = document.getElementById(`ProductSubmitButton-${sectionId}`);

  // Scroll detection
  const observerOptions = {
    root: null,
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Show sticky bar when main button is NOT intersecting and is above the viewport
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        stickyBar.classList.add('sticky-atc--visible');
      } else {
        stickyBar.classList.remove('sticky-atc--visible');
      }
    });
  }, observerOptions);

  if (mainAtcButton) {
    observer.observe(mainAtcButton);
  }

  // Handle variant changes
  subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
    if (event.data.sectionId !== sectionId) return;

    const variant = event.data.variant;
    const html = event.data.html;

    // Update price
    const stickyPrice = stickyBar.querySelector(`#sticky-price-${sectionId}`);
    const sourcePrice = html.getElementById(`price-${sectionId}`);
    if (stickyPrice && sourcePrice) {
      stickyPrice.innerHTML = sourcePrice.innerHTML;
    }

    // Update variant ID in hidden input
    const stickyVariantInput = stickyBar.querySelector('input[name="id"]');
    if (stickyVariantInput) {
      stickyVariantInput.value = variant ? variant.id : '';
      stickyVariantInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Update button state
    const stickyButton = stickyBar.querySelector('[name="add"]');
    const stickyButtonText = stickyButton.querySelector('span');
    if (stickyButton) {
      if (!variant || !variant.available) {
        stickyButton.setAttribute('disabled', 'disabled');
        if (stickyButtonText) stickyButtonText.textContent = window.variantStrings.soldOut;
      } else {
        stickyButton.removeAttribute('disabled');
        if (stickyButtonText) stickyButtonText.textContent = window.variantStrings.addToCart;
      }
    }
  });

  // Success state handling
  subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
    // Check if the sticky button was the one that triggered the add
    // We check activeElement since it should be the button that was clicked
    if (event.source === 'product-form' && stickyBar.contains(document.activeElement)) {
       const stickyButton = stickyBar.querySelector('[name="add"]');
       const stickyButtonText = stickyButton.querySelector('span');
       if (stickyButtonText) {
         const originalText = stickyButtonText.textContent;
         stickyButtonText.textContent = 'Added ✔';
         setTimeout(() => {
           stickyButtonText.textContent = originalText;
         }, 2000);
       }
    }
  });
});
