from pathlib import Path
import json
import os
from typing import Dict, List, Optional, Any
from tqdm import tqdm
from utils.logger import AdvancedLogger
from config.config_manager import ConfigManager

class ReactComponentManager:
    def __init__(self):
        self.logger = AdvancedLogger().get_logger("ComponentManager")
        self.config = ConfigManager().load_config()
        
    @AdvancedLogger().performance_monitor("ComponentManager")
    def create_component(self, project_path: Path, component_name: str, component_type: str = "functional") -> Dict[str, Any]:
        """Create React component with associated files"""
        self.logger.info(f"Creating {component_type} component: {component_name}")
        
        steps = [
            "Creating component directory",
            "Creating component file",
            "Setting up styles",
            "Creating test file",
            "Generating types",
            "Creating story",
            "Updating index exports"
        ]
        
        results = {}
        with tqdm(total=len(steps), desc="Component Creation") as pbar:
            try:
                # Step 1: Create directory
                component_dir = self._ensure_component_directory(project_path, component_name)
                pbar.update(1)
                
                # Step 2: Create component
                results['component'] = self._create_component_file(component_dir, component_name, component_type)
                pbar.update(1)
                
                # Step 3: Setup styles
                results['styles'] = self._setup_component_styles(component_dir, component_name)
                pbar.update(1)
                
                # Step 4: Create tests
                results['tests'] = self._create_test_file(component_dir, component_name)
                pbar.update(1)
                
                # Step 5: Generate types
                results['types'] = self._generate_types(component_dir, component_name)
                pbar.update(1)
                
                # Step 6: Create story
                results['story'] = self._create_story(component_dir, component_name)
                pbar.update(1)
                
                # Step 7: Update exports
                results['exports'] = self._update_exports(component_dir, component_name)
                pbar.update(1)
                
                return results
                
            except Exception as e:
                self.logger.error(f"Component creation failed: {str(e)}")
                raise


    def _ensure_component_directory(self, project_path: Path, component_name: str) -> Path:
        """Ensure component directory exists with proper permissions"""
        if not os.access(project_path, os.W_OK):
            raise PermissionError(f"No write permission for directory: {project_path}")
            
        component_dir = project_path / "src" / "components" / component_name
        
        try:
            component_dir.mkdir(parents=True, exist_ok=True)
            # Verify write access
            test_file = component_dir / ".permission_test"
            test_file.touch()
            test_file.unlink()
            return component_dir
        except (PermissionError, OSError) as e:
            self.logger.error(f"Failed to create/verify component directory: {str(e)}")
            raise

    def _get_component_template(self, component_name: str, component_type: str) -> str:
        """Get the appropriate component template"""
        if component_type == "functional":
            return f"""
            import React from 'react';
            import {{ {component_name}Props }} from './types';
            import * as S from './styles';

            const {component_name}: React.FC<{component_name}Props> = () => {{
                return (
                    <S.StyledWrapper>
                        {component_name} Component
                    </S.StyledWrapper>
                );
            }};

            export default {component_name};
            """
        else:
            return f"""
            import React, {{ Component }} from 'react';
            import {{ {component_name}Props }} from './types';
            import * as S from './styles';

            class {component_name} extends Component<{component_name}Props> {{
                render() {{
                    return (
                        <S.StyledWrapper>
                            {component_name} Component
                        </S.StyledWrapper>
                    );
                }}
            }}

            export default {component_name};
            """


    def _create_component_file(self, component_dir: Path, component_name: str, component_type: str) -> Dict[str, Any]:
        """Create the main component file"""
        component_file = component_dir / f"{component_name}.tsx"
        template = self._get_component_template(component_name, component_type)
        
        with open(component_file, 'w') as f:
            f.write(template.strip())
        
        self.logger.info(f"Component file created: {component_file}")
        return {"path": str(component_file), "type": component_type}

    def _setup_component_styles(self, component_dir: Path, component_name: str) -> Dict[str, Any]:
        """Create styled-components file"""
        styles_file = component_dir / "styles.ts"
        template = """
        import styled from 'styled-components';

        export const StyledWrapper = styled.div`
            // Add your styles here
        `;
        """
        
        with open(styles_file, 'w') as f:
            f.write(template.strip())
        
        self.logger.info(f"Styles file created: {styles_file}")
        return {"path": str(styles_file)}

    def _create_test_file(self, component_dir: Path, component_name: str) -> Dict[str, Any]:
        """Create test file for the component"""
        test_file = component_dir / f"{component_name}.test.tsx"
        template = f"""
        import React from 'react';
        import {{ render, screen }} from '@testing-library/react';
        import {component_name} from './{component_name}';

        describe('{component_name}', () => {{
            it('renders successfully', () => {{
                render(<{component_name} />);
                // Add your test assertions here
            }});
        }});
        """
        
        with open(test_file, 'w') as f:
            f.write(template.strip())
        
        self.logger.info(f"Test file created: {test_file}")
        return {"path": str(test_file)}

    def _generate_types(self, component_dir: Path, component_name: str) -> Dict[str, Any]:
        """Generate TypeScript types for the component"""
        types_file = component_dir / "types.ts"
        template = f"""
        export interface {component_name}Props {{
            // Add your prop types here
        }}
        """
        
        with open(types_file, 'w') as f:
            f.write(template.strip())
        
        self.logger.info(f"Types file created: {types_file}")
        return {"path": str(types_file)}

    def _create_story(self, component_dir: Path, component_name: str) -> Dict[str, Any]:
        """Create Storybook story for the component"""
        story_file = component_dir / f"{component_name}.stories.tsx"
        template = f"""
        import React from 'react';
        import {{ Story, Meta }} from '@storybook/react';
        import {component_name} from './{component_name}';
        import {{ {component_name}Props }} from './types';

        export default {{
            title: 'Components/{component_name}',
            component: {component_name},
        }} as Meta;

        const Template: Story<{component_name}Props> = (args) => <{component_name} {{...args}} />;

        export const Default = Template.bind({{}});
        Default.args = {{
            // Add default props here
        }};
        """
        
        with open(story_file, 'w') as f:
            f.write(template.strip())
        
        self.logger.info(f"Story file created: {story_file}")
        return {"path": str(story_file)}

    def _update_exports(self, component_dir: Path, component_name: str) -> Dict[str, Any]:
        """Update index file with new component exports"""
        index_file = component_dir / "index.ts"
        template = f"""
        export * from './types';
        export {{ default }} from './{component_name}';
        """
        
        with open(index_file, 'w') as f:
            f.write(template.strip())
        
        self.logger.info(f"Index exports updated: {index_file}")
        return {"path": str(index_file)}
