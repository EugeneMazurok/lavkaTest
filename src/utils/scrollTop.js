const scrollTop = (scrollableElement) => {
    if (scrollableElement.value) {
        scrollableElement.value.scrollTo({ top: 0, behavior: "auto" });
    }
};

export default scrollTop;