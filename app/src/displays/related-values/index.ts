import { defineDisplay } from '@directus/shared/utils';
import adjustFieldsForDisplays from '@/utils/adjust-fields-for-displays';
import { getFieldsFromTemplate } from '@directus/shared/utils';
import getRelatedCollection from '@/utils/get-related-collection';
import DisplayRelatedValues from './related-values.vue';
import { useFieldsStore } from '@/stores';
import { getDisplay } from '@/displays';
import { get, set } from 'lodash';
import { renderPlainStringTemplate } from '@/utils/render-string-template';

type Options = {
	template: string;
};

export default defineDisplay({
	id: 'related-values',
	name: '$t:displays.related-values.related-values',
	description: '$t:displays.related-values.description',
	icon: 'settings_ethernet',
	component: DisplayRelatedValues,
	options: ({ editing, relations }) => {
		const relatedCollection = relations.o2m?.collection ?? relations.m2o?.related_collection;

		const displayTemplateMeta =
			editing === '+'
				? {
						interface: 'presentation-notice',
						options: {
							text: '$t:displays.related-values.display_template_configure_notice',
						},
						width: 'full',
				  }
				: {
						interface: 'system-display-template',
						options: {
							collectionName: relatedCollection,
						},
						width: 'full',
				  };

		return [
			{
				field: 'template',
				name: '$t:display_template',
				meta: displayTemplateMeta,
			},
		];
	},
	handler: async (value, options, { collection, field }) => {
		if (!field || !collection) return value;

		const relatedCollections = getRelatedCollection(collection, field.field);

		if (!relatedCollections) return value;

		const fieldsStore = useFieldsStore();

		const fieldKeys = getFieldsFromTemplate(options.template);

		const fields = fieldKeys.map((fieldKey) => {
			return {
				key: fieldKey,
				field: fieldsStore.getField(
					relatedCollections.junctionCollection ?? relatedCollections.relatedCollection,
					fieldKey
				),
			};
		});

		const stringValues: Record<string, string> = {};

		for (const { key, field } of fields) {
			const fieldValue = get(value, key);

			if (fieldValue === null || fieldValue === undefined) continue;

			if (!field?.meta?.display) {
				set(stringValues, key, fieldValue);
				continue;
			}

			const display = getDisplay(field.meta.display);

			const stringValue = display?.handler
				? await display.handler(fieldValue, field?.meta?.display_options ?? {}, {
						interfaceOptions: field?.meta?.options ?? {},
						field: field ?? undefined,
						collection: collection,
				  })
				: fieldValue;

			set(stringValues, key, stringValue);
		}

		return renderPlainStringTemplate(options.template, stringValues);
	},
	types: ['alias', 'string', 'uuid', 'integer', 'bigInteger', 'json'],
	localTypes: ['m2m', 'm2o', 'o2m', 'translations', 'm2a', 'file', 'files'],
	fields: (options: Options | null, { field, collection }) => {
		const { junctionCollection, relatedCollection, path } = getRelatedCollection(collection, field);
		const fieldsStore = useFieldsStore();
		const primaryKeyField = fieldsStore.getPrimaryKeyFieldForCollection(relatedCollection);

		if (!relatedCollection) return [];

		const fields = options?.template
			? adjustFieldsForDisplays(getFieldsFromTemplate(options.template), junctionCollection ?? relatedCollection)
			: [];

		if (primaryKeyField) {
			const primaryKeyFieldValue = path ? [...path, primaryKeyField.field].join('.') : primaryKeyField.field;

			if (!fields.includes(primaryKeyFieldValue)) {
				fields.push(primaryKeyFieldValue);
			}
		}

		return fields;
	},
});
