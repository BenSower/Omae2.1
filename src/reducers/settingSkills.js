/* Define your initial state here.
 *
 * If you change the type from object to something else, do not forget to update
 * src/container/App.js accordingly.
 */

const initialState = {
	active: {},
	knowledge: {},
	groups: {},
	magicSkills: [],
	skillPointsSpent: 0,
	groupPointSpent: 0
};

const skillReducer = (state=initialState, action) => {
	if(action.parameter) {
		var {name, category, max, attribute, skillsInGroup, spec, magicSkills} = action.parameter;
	}

	function changeSkill(skillInfoUpdated, typeSpend, spentPoints, copyState = state, skillCategory = category) {
		return Object.assign(
			{},
			copyState,
			{
				[skillCategory]: Object.assign(
					{},
					copyState[skillCategory],
					skillInfoUpdated),
				[typeSpend]: spentPoints
			}
		);
	}

	function generateSkillObject(skill, updatedSkilInfo) {
		return Object.assign(
			{},
			skill,
			updatedSkilInfo);
	}

	const actionsToTake = {
		INCREMENT_SKILL: () => {
			var newState,
				skill = state[category][name];
			if(skill){
				let nextIncrement = skill.rating + 1||1;
				if (nextIncrement > max - (skill.groupRating || 0)) {

					return state;

				} else {

					newState = changeSkill(
						{[name]: generateSkillObject(skill, {rating: nextIncrement})},
						'skillPointsSpent',
						state.skillPointsSpent + 1
					);

				}
			} else {
				newState = changeSkill(
					{[name]: {
						rating: 1,
						attribute: attribute
					}},
					'skillPointsSpent',
					state.skillPointsSpent + 1
				);
			}
			return newState;
		},

		DECREMENT_SKILL: () => {
			var newState,
				skill = state[category] && state[category][name];
			if(!skill) {

				return state;

			} else if(skill.rating === 1 && Object.keys(skill).length <= 2) {

				newState = changeSkill(
					{},
					'skillPointsSpent',
					state.skillPointsSpent - 1
				);

				delete newState[category][name];

			} else if(skill.rating > 0) {
				let nextDecrement = skill.rating - 1;

				newState = changeSkill(
					{[name]: generateSkillObject(skill, {rating: nextDecrement})},
					'skillPointsSpent',
					state.skillPointsSpent - 1
				);

			}
			return newState;
		},

		INCREMENT_SKILLGROUP: () => {
			var newState,
				skillgroup = state.groups[name];

			if(skillgroup){
				newState = changeSkill(
					{[name]: {rating: skillgroup.rating + 1}},
					'groupPointSpent',
					state.groupPointSpent + 1);
			} else {
				newState = changeSkill(
					{[name]: {
						rating: 1
					}},
					'groupPointSpent',
					state.groupPointSpent + 1);
			}

			var newGroupRating = newState.groups[name].rating;

			for(let skillName in skillsInGroup) {
				let skillAttibute = skillsInGroup[skillName],
					skill = newState.active[skillName],
					skillInfo = skill?
						generateSkillObject(skill, {groupRating: newGroupRating}):
						{groupRating: newGroupRating, attribute: skillAttibute};

				newState = Object.assign(
					{},
					newState,
					{active: Object.assign(
						{},
						newState.active,
						{
							[skillName]: skillInfo
						}
				)});
			}

			return newState;
		},

		DECREMENT_SKILLGROUP: () => {
			var newState,
				skillgroup = state.groups[name],
				newGroupRating = skillgroup && skillgroup.rating - 1;

			if(!skillgroup) {
				return state;
			} else if(skillgroup.rating === 1) {
				newState = changeSkill(
					{},
					'groupPointSpent',
					state.groupPointSpent - 1
				);

				delete newState.groups[name];
			} else if (skillgroup.rating > 0) {
				newState = changeSkill(
					{[name]: generateSkillObject(skillgroup, {rating: newGroupRating})},
					'groupPointSpent',
					state.groupPointSpent - 1
				);
			}

			for(let skillName in skillsInGroup) {
				newState = Object.assign(
					{},
					newState,
					{active: Object.assign(
						{},
						newState.active,
						{[skillName]:
							Object.assign(
								{},
								newState.active[skillName],
								{groupRating: newGroupRating}
							)
						}
					)}
				);

				let newSkill = newState.active[skillName];

				if(!newSkill.groupRating && !newSkill.rating) {
					delete newState.active[skillName];
				} else if (!newSkill.groupRating && newSkill.rating > 0) {
					delete newState.active[skillName].groupRating;
				}
			}

			return newState;
		},

		SET_SPEC: () => {
			let newState,
				skill = state[category][name];

			if(!skill) {
				return state;
			} else if (spec === '–' || spec === '') {
				let newSkill = generateSkillObject(skill, {spec: spec});

				newState = changeSkill(
					{[name]: newSkill},
					'skillPointsSpent',
					state.skillPointsSpent - 1
					);

				delete newState[category][name].spec;

			} else if (typeof spec === 'string') {
				let newSkill = generateSkillObject(skill, {spec: spec}),
					skillPointChange = skill.spec ? state.skillPointsSpent : state.skillPointsSpent + 1;

				newState = changeSkill(
					{[name]: newSkill},
					'skillPointsSpent',
					skillPointChange
					);
			} else {
				return state;
			}

			return newState;
		},

		SET_MAGIC_SKILLS: () => {
			let newState = state;

			function removeMagicSkillRatingFromSkill(currentState, oldSkillName) {
				let copyState = Object.assign({}, currentState);
				if(currentState.active[oldSkillName] && Object.keys(currentState.active[oldSkillName]).length >= 3) {
					copyState.active[oldSkillName] = Object.assign(
						{},
						currentState.active[oldSkillName]
					);

					delete copyState.active[oldSkillName].magicSkillRating;

				} else if (currentState.active[oldSkillName] && Object.keys(currentState.active[oldSkillName]).length >= 2) {

					copyState.active = Object.assign(
						{},
						currentState.active
					);

					delete copyState.active[oldSkillName];
				}

				return copyState;
			}

			magicSkills.forEach((magSkill, index)=>{
				const oldSkillName = state.magicSkills[index];

				if(!magSkill || !magSkill.name) {
					newState = Object.assign(
						{},
						removeMagicSkillRatingFromSkill(newState, oldSkillName),
						{magicSkills: newState.magicSkills.slice()}
					) ;

					newState.magicSkills[index] = '';
				} else if(state.magicSkills[index] !== magSkill.name) {
					const skill = newState.active[magSkill.name],
						newSkill = skill ? generateSkillObject(skill, {magicSkillRating: magSkill.rating}) : {[magSkill.name]: {attribute: magSkill.attribute, magicSkillRating: magSkill.rating}};

					newState = changeSkill(
						newSkill,
						'magicSkills',
						newState.magicSkills.slice(),
						newState,
						'active'
					);

					newState = removeMagicSkillRatingFromSkill(newState, oldSkillName);

					newState.magicSkills[index] = magSkill.name;
				}

			});

			return newState;
		},

		DEFAULT: () => { return state; }
	};

	return (actionsToTake[action.type] || actionsToTake.DEFAULT)();
};

module.exports = skillReducer;
