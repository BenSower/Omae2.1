/* Define your initial state here.
 *
 * If you change the type from object to something else, do not forget to update
 * src/container/App.js accordingly.
 */

const initialState = {
	Positive: [],
	Negative: [],
	karma: {
		Positive: 0,
		Negative: 0
	}
};

const qualityReducer = (state=initialState, action) => {
	const actionsToTake = {
		SELECT_QUALITY: () => {
			const {newQuality} = action.parameter,
				{category} = newQuality;

			return Object.assign(
					{},
					state,
					{
						[category]: [
							...state[category],
							newQuality
						],
						karma: Object.assign(
							{},
							state.karma,
							{
								[category]: state.karma[category] + Number(newQuality.karma)
							}
						)
					}
				);
		},
		REMOVE_QUALITY: () => {
			const {qualityIndex, category} = action.parameter,
				qualityArray = state[category],
				removeQualityKarma = state[category][qualityIndex].karma;
			return Object.assign(
					{},
					state,
					{
						[category]: [
							...qualityArray.slice(0, qualityIndex),
							...qualityArray.slice(qualityIndex + 1)
						],
						karma: Object.assign(
							{},
							state.karma,
							{
								[category]: state.karma[category] - Number(removeQualityKarma)
							}
						)
					}
				);
		},
		DEFAULT: () => { return state; }
	};
	return (actionsToTake[action.type] || actionsToTake.DEFAULT)();
};

module.exports = qualityReducer;
