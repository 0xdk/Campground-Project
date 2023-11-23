let joi = require('joi');
const sanitizeHtml = require('sanitize-html');

// sanitizeHtml show this warning, sill haven't figured out how to solve this warning

// ⚠️ Your `allowedTags` option includes, `style`, which is inherently
// vulnerable to XSS attacks. Please remove it from `allowedTags`.
// Or, to disable this warning, add the `allowVulnerableTags` option
// and ensure you are accounting for this risk.

// const extension = (joi) => ({
//   type: 'string',
//   base: joi.string(),
//   messages: {
//     'string.escapeHtml': '{{#label}} must not include HTML!',
//   },
//   rules: {
//     escapeHtml: {
//       validate(value, helpers) {
//         // escape symbols only (e.g. &, <)
//         const filtered = sanitizeHtml(value, {
//           allowedTags: false,
//           allowedAttributes: false,
//         });
//         // remove html
//         const clean = sanitizeHtml(filtered, {
//           allowedTags: [],
//           allowedAttributes: {},
//           allowVulnerableTags: true, // Disable the warning
//         });
//         // show error if html was present/removed
//         if (clean !== filtered) return helpers.error('string.escapeHtml');
//       },
//     },
//   },
// });

// const joi = baseJoi.extend(extension);

module.exports.campSchema = joi.object({
  campground: joi
    .object({
      title: joi.string().required(),
      price: joi.number().required().min(1),
      // image: joi.string().required(),
      description: joi.string().required(),
      location: joi.string().required(),
    })
    .required(),
  deleteImages: joi.array(),
});

// schema for review

// writing joi.object({review: joi.object({})}) because it's review[rating]
module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      review: joi.string().required(),
      rating: joi.number().required().min(0).max(5),
    })
    .required(),
});
