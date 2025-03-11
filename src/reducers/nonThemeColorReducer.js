const initialState = '#000000'; // Ĭ����ɫ

const nonThemeColorReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_NON_THEME_COLOR':
            return action.payload;
        default:
            return state;
    }
};

export default nonThemeColorReducer;