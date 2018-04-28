import qs from "qs";

export const searchStateFromQueryString = (search) => {
    return search.includes('?')
        ? qs.parse(search.substring(search.indexOf('?') + 1))
        : {};
};
