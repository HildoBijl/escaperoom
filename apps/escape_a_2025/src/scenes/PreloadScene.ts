import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Rectangle;
  private percentText!: Phaser.GameObjects.Text;
  private targetScene = "IntroScene";

  constructor() {
    super("PreloadScene");
  }

  init(data: { targetScene?: string }) {
    if (data?.targetScene) this.targetScene = data.targetScene;
  }

  preload() {
    const { width, height } = this.scale;

    // Loading UI
    this.progressBar = this.add.rectangle((width / 2) - 250, height / 2 + 20, 0, 50, 0x8fd5ff, 1).setOrigin(0, 0.5);
    this.percentText = this.add.text(width / 2, height / 2 + 90, "0%", {
      fontFamily: "sans-serif",
      fontSize: "20px",
      color: "#cfe8ff",
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 60, "Lancering voorbereiden...", {
      fontFamily: "sans-serif",
      fontSize: "32px",
      color: "#cfe8ff",
    }).setOrigin(0.5);

    // Progress handlers
    this.load.on("progress", (value: number) => {
      this.progressBar.width = 500 * value;
      this.percentText.setText(`${Math.round(value * 100)}%`);
    });
    this.load.on("complete", () => {
      this.time.delayedCall(200, () => this.scene.start(this.targetScene));
    });

    // ---------------------------
    // Asset loads (replace paths with your chosen pack)
    // ---------------------------
    // Lander / spaceship (e.g., from Kenney or itch.io packs)
    this.load.image("ship", "/assets/decor/ship.webp");
    this.load.image("letter", "/assets/decor/letter.webp");
    this.load.image("farm", "/assets/decor/farm.webp");
    this.load.image("farmer", "/assets/decor/farmer.webp");
    this.load.image("wooden_sign", "/assets/decor/wooden_sign.webp");
    this.load.image("wooden_panel", "/assets/decor/wooden_panel.webp");

    // Small spark/smoke particle (8x8-ish white dot or smoke puff)
    // this.load.image("spark", "/assets/particles/spark.webp");

    // KVQ
    this.load.image("twelve", "/assets/decor/kvq/12.webp");
    this.load.image("twelve_sign", "/assets/decor/kvq/12_sign.webp");
    this.load.image("ei", "/assets/decor/kvq/ei.webp");
    this.load.image("ei_sign", "/assets/decor/kvq/ei_sign.webp");
    this.load.image("fruitmand", "/assets/decor/kvq/fruitmand.webp");
    this.load.image("fruitmand_sign", "/assets/decor/kvq/fruitmand_sign.webp");
    this.load.image("vierkant_logo", "/assets/decor/kvq/vierkant_logo.webp");
    this.load.image("vierkant_logo_sign", "/assets/decor/kvq/vierkant_logo_sign.webp");
    this.load.image("vraagtekens", "/assets/decor/kvq/vraagtekens.webp");
    this.load.image("vraagtekens_sign", "/assets/decor/kvq/vraagtekens_sign.webp");
    this.load.image("driehoek", "/assets/decor/kvq/driehoek.webp");
    this.load.image("driehoek_sign", "/assets/decor/kvq/driehoek_sign.webp");
    this.load.image("1kers", "/assets/decor/fruit/1kers.webp");
    this.load.image("1peer", "/assets/decor/fruit/1peer.webp");
    this.load.image("2kersen", "/assets/decor/fruit/2kersen.webp");
    this.load.image("6druiven", "/assets/decor/fruit/6druiven.webp");
    this.load.image("8druiven", "/assets/decor/fruit/8druiven.webp");

    // Rocks / tufts / debris (any small PNGs)
    this.load.image("rock", "/assets/decor/rock.webp");
    this.load.image("tuft1", "/assets/decor/purple_tuft.webp");
    this.load.image("tuft2", "/assets/decor/cactus.webp");
    this.load.image("debris1", "/assets/decor/tuft.webp");
    this.load.image("chest","/assets/decor/chest.webp")
    this.load.image("chest_2","/assets/decor/chest_2.webp")
    this.load.image("chest_2_open","/assets/decor/chest_2_open.webp")
    this.load.image("tower","/assets/decor/tower.webp")
    this.load.image("brokenpanel","/assets/decor/brokenpanel.webp")
    this.load.image("telescope","/assets/decor/telescope.webp")
    this.load.image("background_tower","/assets/decor/background_tower.webp")
    this.load.image("balance_scale_puzzle","/assets/decor/balance_scale_puzzle.webp")
    this.load.image("zippu","/assets/decor/zippu.webp")
    this.load.image("mazedoor","/assets/decor/mazedoor.webp")
    this.load.image("poffie","/assets/decor/poffie.webp")
    this.load.image("plok","/assets/decor/plok.webp")
    this.load.image("whiteboard","/assets/decor/whiteboard.webp")
    this.load.image("morsesheet","/assets/decor/morse.webp")
    this.load.image("quadratus","/assets/decor/quadratus.webp")

    // Characters - LOD (Level of Detail) approach
    this.load.image("quadratus_small", "/assets/quadratus_small.webp"); // 200x336 for gameplay
    this.load.image("quadratus_large", "/assets/quadratus_large.webp"); // 729x1224 for close-ups

    // Player images - simple 2D top-down
    this.load.image("player_normal_1", "/assets/player/1.webp");
    this.load.image("player_normal_2", "/assets/player/2.webp");
    this.load.image("player_normal_3", "/assets/player/3.webp");
    this.load.image("player_normal_4", "/assets/player/4.webp");
    this.load.image("player_normal_5", "/assets/player/5.webp");
  }

  create() {
    // Nothing else needed; we go to TitleScene in on('complete')
  }
}
