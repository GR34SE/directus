import { defineOperationApp } from '@directus/shared/utils';
import { toArray } from '@directus/shared/utils';

export default defineOperationApp({
	id: 'read',
	icon: 'visibility',
	name: '$t:operations.read.name',
	description: '$t:operations.read.description',
	preview: ({ mode, collection, key }) => {
		const previewOptions = [
			{
				label: '$t:operations.read.mode.field',
				text: mode,
			},
			{
				label: '$t:collection',
				text: collection,
			},
		];

		if (mode !== 'query') {
			previewOptions.push({
				label: '$t:operations.read.key',
				text: key ? toArray(key).join(', ') : '--',
			});
		}

		return previewOptions;
	},
	options: [
		{
			field: 'mode',
			name: '$t:operations.read.mode.field',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{
							text: '$t:operations.read.mode.one',
							value: 'one',
						},
						{
							text: '$t:operations.read.mode.many',
							value: 'many',
						},
						{
							text: '$t:operations.read.mode.query',
							value: 'query',
						},
					],
				},
			},
		},
		{
			field: 'permissions',
			name: '$t:permissions',
			type: 'string',
			schema: {
				default_value: '$trigger',
			},
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{
							text: 'From Trigger',
							value: '$trigger',
						},
						{
							text: 'Public Role',
							value: '$public',
						},
						{
							text: 'Full Access',
							value: '$full',
						},
					],
					allowOther: true,
				},
			},
		},
		{
			field: 'collection',
			name: '$t:collection',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'system-collection',
			},
		},
		{
			field: 'key',
			name: '$t:operations.read.key',
			type: 'csv',
			meta: {
				width: 'half',
				interface: 'tags',
				options: {
					iconRight: 'vpn_key',
				},
				conditions: [
					{
						rule: {
							mode: {
								_eq: 'query',
							},
						},
						hidden: true,
					},
				],
			},
		},
		{
			field: 'query',
			name: '$t:operations.read.query',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: {
					language: 'json',
				},
			},
		},
	],
});
