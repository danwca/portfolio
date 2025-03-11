const initialState = {
    backgroundColor: '#ffffff', // Ä¬ÈÏ±³¾°ÑÕÉ«
};

const uiColorReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_BACKGROUND_COLOR':
            return {
                ...state,
                backgroundColor: action.payload,
            };
        default:
            return state;
    }
};

export default uiColorReducer;