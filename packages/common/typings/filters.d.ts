declare module '@tensei/common/filters' {
    import { FilterQuery, Dictionary } from '@mikro-orm/core';

    interface FilterConfig<T> {
        name: string;
        shortName: string;
        args?: boolean;
        default: boolean;
        dashboardView?: boolean;
        cond: FilterCondition<T>;
    }

    type FilterCondition<T = any> = (args: Dictionary, type: 'read' | 'update' | 'delete') => FilterQuery<any> | Promise<FilterQuery<T>>;

    export interface FilterContract<T = any> {
        config: FilterConfig<T>;
        query(condition: FilterCondition<T>): this;
        dashboardView(): this;
        noArgs(): this;
        default(): this;
    }

    export function filter<T = any>(name: string, slug?: string): FilterContract<T>;
}
