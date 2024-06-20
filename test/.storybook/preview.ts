import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";

const preview = {
	parameters: {
		viewport: {
			defaultViewport: "responsive",
			viewports: {
				...INITIAL_VIEWPORTS,
				ultrawide: {
					name: "ultrawide",
					styles: {
						height: "1280px",
						width: "2560px",
					},
					type: "other",
				},
			},
		},
	},
};

export default preview;
