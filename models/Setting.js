import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
    website_title: {
        type: String,
        required: true
    },
    website_logo: {
        type: String,
        required: true
    },
    footer_description: {
        type: String,
        required: true
    }
});

const Setting = mongoose.model('Setting', SettingSchema);

export default Setting;