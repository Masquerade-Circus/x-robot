## [1.2.0](https://github.com/Masquerade-Circus/x-robot/compare/1.1.0...1.2.0) (2026-05-15)

### Features

*   add @x-robot/react adapter ([147486e](https://github.com/Masquerade-Circus/x-robot/commit/147486e4df7b04f2f36f1a6f972185d08d0d0f0a))

### Documentation

*   update docs ([f8aa666](https://github.com/Masquerade-Circus/x-robot/commit/f8aa666cd8622473152c12f68877ecc88a6d11e8))

### Code Refactoring

*   **documentate:** expand documentate diagram exports ([bfae059](https://github.com/Masquerade-Circus/x-robot/commit/bfae059260ef25133b68af0775930355ec9e582b))
*   **mermaid:** make documentate mermaid handle the same amount of context that planuml ([5c45a7a](https://github.com/Masquerade-Circus/x-robot/commit/5c45a7a874267e4c4abb8ad2f88f84c9c1eb4d32))

## [1.1.0](https://github.com/Masquerade-Circus/x-robot/compare/1.0.1...1.1.0) (2026-03-10)

### Features

*   add dev-tools ([1f61467](https://github.com/Masquerade-Circus/x-robot/commit/1f61467d93abd8b917f41de576811be4a77a1ad3))

### Code Refactoring

*   improve mermaid code ([f19e6ca](https://github.com/Masquerade-Circus/x-robot/commit/f19e6ca0e1f4b02434a27972811b98342c7ea0a4))

### [1.0.1](https://github.com/Masquerade-Circus/x-robot/compare/1.0.0...1.0.1) (2026-03-08)

### Documentation

*   remove context7.json ([d0f3f1b](https://github.com/Masquerade-Circus/x-robot/commit/d0f3f1b92408c8428fd8275475c642d353afcfe6))
*   update docs ([732203d](https://github.com/Masquerade-Circus/x-robot/commit/732203df2c81878a031fc3421dffcd8352fdaa92))

## [1.0.0](https://github.com/Masquerade-Circus/x-robot/compare/0.3.0...1.0.0) (2026-03-08)

### Features

*   add exitPulses directives ([5a7fcfa](https://github.com/Masquerade-Circus/x-robot/commit/5a7fcfae85eb8b5023f1ecadf79e303dc4039dce))
*   add scxml import/export support ([bcf33a0](https://github.com/Masquerade-Circus/x-robot/commit/bcf33a0b51dcbe2261765f4d85ed9f4cde767969))
*   implement get snapshot and resotre machine from snapshot ([637302d](https://github.com/Masquerade-Circus/x-robot/commit/637302d631216866ee1917b10ca73d57a38090ad))
*   implement invokeAfter ([c43f47f](https://github.com/Masquerade-Circus/x-robot/commit/c43f47f3be1b95761f30b1c7cb9a48fbbe3c0b80))
*   implement mermaid export ([b81c3c2](https://github.com/Masquerade-Circus/x-robot/commit/b81c3c263c6d899ef04d2470144afdd771239887))

### Tests

*   update benchmark tests ([43ea191](https://github.com/Masquerade-Circus/x-robot/commit/43ea191d0c670c2bf91f3676d5a2153ff2db9d24))
*   update tests an documentation ([6561229](https://github.com/Masquerade-Circus/x-robot/commit/656122906b4cc852137dc5c59edf236f5da39a32))

### Documentation

*   update documentation ([3e91d80](https://github.com/Masquerade-Circus/x-robot/commit/3e91d80c5af0621165f8d26960d2483260daef11))

### Code Refactoring

*   change actions+producers to pulses ([c945143](https://github.com/Masquerade-Circus/x-robot/commit/c9451437ad14fe122ea88f06d5a3ad523220cf03))
*   create documentate module to handle all machine conversions ([59af0ee](https://github.com/Masquerade-Circus/x-robot/commit/59af0eecebbc49805b059ec5cc5e29f82cf20fd0))
*   refactor tests to use pulses ([3ab8fd4](https://github.com/Masquerade-Circus/x-robot/commit/3ab8fd47ea9508176231b3b0ea92f62408652afd))
*   refactor the api to use pulses ([5737eb3](https://github.com/Masquerade-Circus/x-robot/commit/5737eb361ee334e1ba3ec2fef97bba42103c6ae7))
*   regenerate docs and mermaid implementation ([b240488](https://github.com/Masquerade-Circus/x-robot/commit/b2404884cc30e7d452d6165fdc8d8df963da4904))
*   rename pulse to entry and exitPulse to exit ([dc79239](https://github.com/Masquerade-Circus/x-robot/commit/dc792398b66fe0a1f09f62c0779dbd0ccc3385e9))
*   update readme ([f00734e](https://github.com/Masquerade-Circus/x-robot/commit/f00734e1a7c2dfcfdca0b0a224d70e89f59da5f6))
*   use custom tree-adapter to import/export mcxml ([dcadc4e](https://github.com/Masquerade-Circus/x-robot/commit/dcadc4e69dae6a3e4985952bfb10755b328c6572))

## [0.3.0](https://github.com/Masquerade-Circus/x-robot/compare/0.2.0...0.3.0) (2022-07-08)

### Features

*   add start method to run initial state actions and producers ([0346b56](https://github.com/Masquerade-Circus/x-robot/commit/0346b56ded0459e47112838fdff1659275c0e6aa))

### Styles

*   update coding style ([08c8d6c](https://github.com/Masquerade-Circus/x-robot/commit/08c8d6c36b466355173888805d409dee2a709c22))

### Documentation

*   update parallel example ([55c712e](https://github.com/Masquerade-Circus/x-robot/commit/55c712e6f1b355d5975fbe7fb98932a57c7f86aa))

### Tests

*   add benchmarks to compare x-robot with xstate and robot3 ([4337c37](https://github.com/Masquerade-Circus/x-robot/commit/4337c3711652cf5ffd7d35fcf716e1363c728d41))
*   update the async example benchmarks ([9ddab88](https://github.com/Masquerade-Circus/x-robot/commit/9ddab88d3d7c0c3e7007fab5f1ffce966cbf1e1b))

### Build System

*   add documentation. Remove yarn. Update dependencies ([26eded6](https://github.com/Masquerade-Circus/x-robot/commit/26eded61d23cb6ac2885425b195058176a3cfc72))

*   add minimist to override dependencies ([91bd610](https://github.com/Masquerade-Circus/x-robot/commit/91bd610d34e6aca5c7862ad459690c566181c7b9))

*   remove dist dir from .gitignore. Add exports to package.json ([758560a](https://github.com/Masquerade-Circus/x-robot/commit/758560a583ae57f16eb6fda1b235da33dd734c12))

*   feat: implement parallel states (5bad841)

## 0.1.0 (2021-11-16)

### Features

*   initial-implementation ([b44e0c1](https://github.com/Masquerade-Circus/x-robot/commit/b44e0c1c14dff34847d11f5374ab8266f7013e5a))

### Miscellaneous Chores

*   add-conventional-commits-and-release-it ([71f7dfe](https://github.com/Masquerade-Circus/x-robot/commit/71f7dfeea54f8dbdbf5b96ad2c04cf227bab3b8f))

### Documentation

*   fix-doc-svgs ([fb7ba03](https://github.com/Masquerade-Circus/x-robot/commit/fb7ba03c580080a1f6454d4911b9a7f7dc8c0ac9))
