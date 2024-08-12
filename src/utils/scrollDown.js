const scrollDown = (scrollableElement, currentScrollPosition) => {
    if (scrollableElement.value) {
        scrollableElement.value.scrollTo({ top: currentScrollPosition.value });
    }
};

export default scrollDown;