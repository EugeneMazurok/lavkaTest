const scrollDown = (scrollableElement, currentScrollPosition) => {
    if (scrollableElement.value) {
        scrollableElement.value.scrollTo({ top: currentScrollPosition.value });
        currentScrollPosition.value = scrollableElement.value.scrollTop;
    }
};

export default scrollDown;