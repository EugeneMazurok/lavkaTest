const scrollDown = (scrollableElement, currentScrollPosition) => {
    if (scrollableElement.value) {
        scrollableElement.value.scrollBy({ top: currentScrollPosition.value, behavior: 'auto' });
    }
}

export default scrollDown;