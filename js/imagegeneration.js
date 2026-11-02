const fs = require('node:fs/promises');
const { sequelize, Character } = require('./database');
const { generateAvatarPrompt } = require('./textgeneration');

const FORGE_URL = 'http://127.0.0.1:7860/sdapi/v1/txt2img';

const CLASS_PROMPTS = {
    "Técnico": "brown apron, tool belt, white shirt, collared shirt",
    "Médico": "white lab coat, stethoscope, medical uniform",
    "Explorador": "pith helmet, camouflage coat, military uniform",
    "Guardião": "security guard, uniform, dark blue shirt, tactical vest"
}

async function generateImage(prompt, seed = -1, steps = 20, cfg_scale = 6.5) {
  const payload = {
    prompt: prompt,
    negative_prompt: '',
    styles: ["rpg-slop-avatar"],
    seed,
    steps,
    cfg_scale,
    width: 640,
    height: 960,
    sampler_name: 'Euler a',

    // enable_hr: true,
    // hr_scale: 1.5,
    // hr_upscaler: 'R-ESRGAN 4x+',
    // denoising_strength: 0.45,
    // hr_second_pass_steps: 150

//     override_settings: {
//     sd_model_checkpoint: "DreamShaperXL_Lightning-SFW.safetensors",
//     CLIP_stop_at_last_layers: 1
//   }
  };

  try {
    const response = await fetch(FORGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`erro http: ${response.status}`);
    }

    const data = await response.json();

    if (data.info) {
        const info = JSON.parse(data.info);
        console.log('dados da geração');
        console.log('prompt:', info.all_prompts?.[0] || info.prompt);
        console.log('neg prompt:', info.all_negative_prompts?.[0] || info.negative_prompt);
        console.log('styles:', info.styles);
        console.log('seed:', info.seed);
    }

    const fileName = `gen_${Date.now()}.png`;
    for (const [index, base64Data] of data.images.entries()) {
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.writeFile(`public/output/${fileName}`, buffer);
    }

    console.log(`imagem gerada: "${fileName}"`);
    return fileName;
  } catch (error) {
    console.error('erro na geração:', error);
  }
  return null;
}

async function generateAvatar(characterUUID, appearance, characterClass) {
    const formattedAppearance = await generateAvatarPrompt(appearance)
    const classPrompt = CLASS_PROMPTS[characterClass];
    const fullPrompt = `head and shoulders, looking at viewer, ${formattedAppearance}, ${classPrompt}`;
    
    console.log(`generating avatar for character ${characterUUID}\nprompt: "${formattedAppearance}"`);
    const imageName = await generateImage(fullPrompt);

    try {
        await Character.update(
            { imageUrl: `public/output/${imageName}` },
            { where: { id: characterUUID } }
        );
    } catch(err) {
        console.error(err);
    }
    
    // return imageName;
}

module.exports = { generateImage, generateAvatar };